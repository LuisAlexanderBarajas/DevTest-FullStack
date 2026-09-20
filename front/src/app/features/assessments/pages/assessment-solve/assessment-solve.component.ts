import { Component, inject, OnInit, OnDestroy,signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { AssessmentService } from '../../services/assessment.service';
import { AuthService } from '../../../auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assessment-solve',
  standalone: true,
  imports: [FormsModule, MonacoEditorModule],
  templateUrl: './assessment-solve.component.html',
  styleUrl: './assessment-solve.component.css'
})
export class AssessmentSolveComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private assessmentService = inject(AssessmentService);

  assessmentId: number = 0;
  attemptId: number | null = null;
  
  // Datos de la evaluación
  assessmentData: any = null;
  questions: any[] = [];
  currentIndex = signal<number>(0);
  
  // Variables reactivas
  selectedLanguage = signal<string>('java');
  isExecuting = signal<boolean>(false);
  consoleOutput = signal<string>('Esperando ejecución...');
  code: string = '';

  editorOptions = { theme: 'vs-dark', language: 'java', minimap: { enabled: false } };

  // diccionario para guardar elc odigo
  codeDrafts = new Map<number, string>();

  // variables para el cronómetro
  timeRemaining = signal<number>(0);
  formattedTime = signal<string>('00:00');
  timerInterval: any;
  passedTestsDrafts = new Map<number, number>();

  private authService = inject(AuthService);

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  ngOnInit() {
    this.attemptId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAttemptDetails();
  }

  loadAttemptDetails() {
    if (!this.attemptId) {
      console.error('No se encontró un ID de intento válido.');
      return;
    }

    this.assessmentService.getAttemptById(this.attemptId).subscribe({
      next: (attempt: any) => {
        this.assessmentData = attempt.assessment;
        this.questions = attempt.assessment.questions || [];
        
        if (this.questions.length > 0) {
          this.setSnippetForLanguage('java');

          // Calculo del tiempo restante
          const startedAtTime = new Date(attempt.startedAt).getTime();
          const timeLimitMs = (this.assessmentData.timeLimitMinutes || 30) * 60 * 1000;
          const expirationTime = startedAtTime + timeLimitMs;
          const now = new Date().getTime();

          const remainingSeconds = Math.floor((expirationTime - now) / 1000);

          if (remainingSeconds <= 0) {
            this.timeRemaining.set(0);
            this.updateFormattedTime();
            
            Swal.fire({
              title: 'Tiempo agotado',
              text: 'El tiempo de la evaluación expiró mientras estabas fuera. Se enviará automáticamente.',
              icon: 'warning',
              allowOutsideClick: false,
              confirmButtonColor: '#2563eb'
            }).then(() => {
              this.executeSubmit();
            });
          } else {
              this.timeRemaining.set(remainingSeconds);
              this.startTimer();
          }
          }
      },
      error: (err) => console.error('Error cargando los detalles del intento', err)
    });
  }

  startAttempt() {
    const realUserId = this.authService.getRealUserId();
    
    if (!realUserId) {
      console.error('Brecha de seguridad: No se pudo obtener el ID real del token.');
      return; 
    }

    this.assessmentService.startAssessment(realUserId, this.assessmentId).subscribe({
      next: (res) => {
        this.attemptId = res.id; 
        console.log('Evaluación iniciada con Attempt ID:', this.attemptId);
      },
      error: (err) => console.error('Error al iniciar el intento', err)
    });
  }

  // Cronometro logica
  startTimer() {
    this.updateFormattedTime();
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining() > 0) {
        this.timeRemaining.update(t => t - 1);
        this.updateFormattedTime();
      } else {
        clearInterval(this.timerInterval);
        this.autoSubmit();
      }
    }, 1000);
  }

  updateFormattedTime() {
    const minutes = Math.floor(this.timeRemaining() / 60);
    const seconds = this.timeRemaining() % 60;
    this.formattedTime.set(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }

  // navegacion entre preguntas

  changeQuestion(step: number) {
    const currentQId = this.questions[this.currentIndex()].id;
    
    this.codeDrafts.set(currentQId, this.code);

    this.currentIndex.update(index => index + step);

    const newQId = this.questions[this.currentIndex()].id;
    if (this.codeDrafts.has(newQId)) {
      this.code = this.codeDrafts.get(newQId)!;
    } else {
      this.setSnippetForLanguage(this.selectedLanguage());
    }

    this.consoleOutput.set('Esperando ejecución...');
  }

  // logica del editor

  onLanguageChange(event: any) {
    const lang = event.target.value;
    this.selectedLanguage.set(lang);
    this.editorOptions = { ...this.editorOptions, language: lang };
    
    this.setSnippetForLanguage(lang);
  }

  setSnippetForLanguage(lang: string) {
    if (lang === 'java') this.code = 'public class Main {\n    public static void main(String[] args) {\n        // Tu código aquí\n    }\n}';
    if (lang === 'javascript') this.code = 'function solve() {\n    // Tu código aquí\n}\nsolve();';
    if (lang === 'python') this.code = 'def solve():\n    # Tu código aquí\n    pass\n\nsolve()';
  }

  executeCode() {
    if (!this.code.trim() || this.questions.length === 0) return;

    this.isExecuting.set(true);
    this.consoleOutput.set('Levantando entorno seguro y ejecutando código...\n');

    const activeQuestion = this.questions[this.currentIndex()];

    const payload = {
      questionId: activeQuestion.id,
      language: this.selectedLanguage().toLowerCase(),
      code: this.code
    };

    const url = `${environment.apiUrl.replace(/\/$/, '')}/code-runner/run`;

    this.http.post<any>(url, payload).subscribe({
      next: (res) => {
        this.consoleOutput.set(res.consoleOutput);
        this.isExecuting.set(false);
        const currentQId = activeQuestion.id;
        const previousBest = this.passedTestsDrafts.get(currentQId) || 0;
        if (res.passedCases > previousBest) {
          this.passedTestsDrafts.set(currentQId, res.passedCases);
        }
      },
      error: (err) => {
        const errorMsg = err.error?.error || err.message || 'Error desconocido';
        this.consoleOutput.set(`[ERROR DEL SERVIDOR]\nNo se pudo ejecutar el código.\nDetalle: ${errorMsg}`);
        this.isExecuting.set(false);
      }
    });
  }

  // logica de envio
 submitAssessment() {
    Swal.fire({
      title: '¿Terminar y enviar?',
      text: "No podrás cambiar tus respuestas después de enviar la prueba.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, enviar evaluación',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.executeSubmit();
      }
    });
  }

  autoSubmit() {
    Swal.fire({
      title: '¡Se acabó el tiempo!',
      text: 'La evaluación se enviará automáticamente con lo que hayas alcanzado a resolver.',
      icon: 'info',
      confirmButtonColor: '#2563eb',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then(() => {
      this.executeSubmit();
    });
  }

  private executeSubmit() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (!this.attemptId) return;

    if (this.questions.length > 0) {
      this.codeDrafts.set(this.questions[this.currentIndex()].id, this.code);
    }

    const submissions = this.questions.map(q => {
      return {
        questionId: q.id,
        submittedCode: this.codeDrafts.get(q.id) || '',
        passedTests: this.passedTestsDrafts.get(q.id) || 0
      };
    });

    this.consoleOutput.set('Enviando resultados finales...\n');

    Swal.fire({
      title: 'Procesando...',
      text: 'Evaluando y guardando tus resultados',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.assessmentService.submitAssessment(this.attemptId, submissions).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Buen trabajo!',
          text: 'Evaluación enviada con éxito.',
          icon: 'success',
          confirmButtonColor: '#10b981'
        }).then(() => {
          this.router.navigate([`/assessment/result/${this.attemptId}`]);
        });
      },
      error: (err) => {
        console.error('Error al enviar la prueba', err);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un problema al enviar la evaluación.',
          icon: 'error',
          confirmButtonColor: '#2563eb'
        });
      }
    });
  }

}