import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class AssessmentFormService {
  private fb = inject(FormBuilder);

  // Lista global de lenguajes permitidos para los tags
  readonly availableLanguages = ['JAVA', 'JAVASCRIPT', 'PYTHON', 'C++', 'C#'];

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    timeLimitMinutes: [60, [Validators.required, Validators.min(1)]],
    questions: this.fb.array([], [Validators.required])
  });

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  getTestCases(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('testCases') as FormArray;
  }

  // --- LÓGICA DE AGREGAR Y QUITAR ---

  addQuestion() {
    const questionGroup = this.fb.group({
      id: [null],
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required]],
      allowedLanguages: ['JAVA,JAVASCRIPT,PYTHON', Validators.required],
      score: [100, [Validators.required, Validators.min(1)]],
      testCases: this.fb.array([], [Validators.required])
    });
    this.questions.push(questionGroup);
    this.addTestCase(this.questions.length - 1);
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  addTestCase(questionIndex: number) {
    const testCaseGroup = this.fb.group({
      id: [null],
      inputData: ['', Validators.required],
      expectedOutput: ['', Validators.required],
      isHidden: [false]
    });
    this.getTestCases(questionIndex).push(testCaseGroup);
  }

  removeTestCase(questionIndex: number, testCaseIndex: number) {
    this.getTestCases(questionIndex).removeAt(testCaseIndex);
  }

  // --- LÓGICA DE ETIQUETAS (TAGS) ---

  toggleLanguage(qIndex: number, lang: string) {
    const control = this.questions.at(qIndex).get('allowedLanguages');
    let currentLangs = control?.value ? control.value.split(',') : [];
    
    if (currentLangs.includes(lang)) {
      currentLangs = currentLangs.filter((l: string) => l !== lang);
    } else {
      currentLangs.push(lang);
    }
    control?.setValue(currentLangs.filter((l: string) => l.trim() !== '').join(','));
  }

  hasLanguage(qIndex: number, lang: string): boolean {
    const control = this.questions.at(qIndex).get('allowedLanguages');
    if (!control?.value) return false;
    return control.value.split(',').includes(lang);
  }

  // --- UTILIDADES ---

  resetForm() {
    this.form.reset({ timeLimitMinutes: 60 });
    this.questions.clear();
  }

  patchForm(data: any) {
    this.resetForm();
    this.form.patchValue({
      name: data.name,
      description: data.description,
      timeLimitMinutes: data.timeLimitMinutes
    });

    data.questions.forEach((q: any) => {
      const qGroup = this.fb.group({
        id: [q.id],
        title: [q.title, [Validators.required, Validators.minLength(5)]],
        description: [q.description, [Validators.required]],
        allowedLanguages: [q.allowedLanguages, Validators.required],
        score: [q.score, [Validators.required, Validators.min(1)]],
        testCases: this.fb.array([])
      });

      const tcArray = qGroup.get('testCases') as FormArray;
      q.testCases.forEach((tc: any) => {
        tcArray.push(this.fb.group({
          id: [tc.id],
          inputData: [tc.inputData, Validators.required],
          expectedOutput: [tc.expectedOutput, Validators.required],
          isHidden: [tc.isHidden]
        }));
      });
      this.questions.push(qGroup);
    });
  }
}