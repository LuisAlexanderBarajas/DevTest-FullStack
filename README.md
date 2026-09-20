# DevTest Platform

## Requisitos Previos
- Docker
- Docker Compose
- Git

## Instalación y Ejecución

### Clonar el repositorio:

```bash
git clone https://github.com/LuisAlexanderBarajas/DevTest-FullStack.git
cd DevTest-FullStack
```
### Construir y levantar los contenedores en segundo plano:
```bash
docker compose up --build -d
```

### Acceso a los servicios:
- Frontend (Interfaz Web): http://localhost
- Backend (API): http://localhost:8080
- Base de Datos (MySQL): localhost:3307 (Usuario: root / Contraseña: admin)


## Credenciales

### Credenciales de Acceso al Sistema admin

- Usuario: Administrador
- Contraseña: admin123

### Credenciales de Acceso al Sistema Candidato

- Usuario: Candidato Prueba

- Contraseña: admin123

### Nota: Puedes crear o registrar mas candidatos si lo deseas

## Detener la Ejecución
### Para detener los servicios conservando la persistencia de la base de datos:

```bash
docker compose down
```

### Para detener los servicios y limpiar los datos de MySQL (reinicio completo):

```bash
docker compose down -v
```

