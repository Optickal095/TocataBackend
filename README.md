# **Tocata**

Software dirigido a los músicos emergentes para difundir sus proyectos musicales y a organizadores de eventos para facilitar contratación de servicios musicales en vivo

## **Software Stack**

El proyecto "Tocata" es una aplicación web desarrollado con las siguientes tecnologías:

- Ubuntu 20.04
- Nodejs 18.15.0
- Angular 15.2.0
- ExpressJs 4.15
- MongoAtlas 6.0
- Bootstrap 5.2
- Yarn
- NPM

# **Configuración de Ejecución**

### **Servidor de producción**

Es importante considerar que para el funcionamiento correcto del proyecto, debe estar corriendo backend y frontend en servidores diferentes.

Para configurar el servidor de producción se deben seguir los siguientes pasos en ambos servidores:

1. Iniciar el modo root e ingresar las credenciales de administrador del servidor

```bash
sudo su
```

2. Actualizar sistema operativo

```bash
apt-get update
```

3. Instalar git para clonar repositorio

```bash
apt-get install git
```

4. Instalar nvm para instalar NodeJs

```bash
curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash
```

5. Reiniciar bash para utilizar comandos NVM

```bash
exec bash
```

6. Instalar NodeJS versión 18.15.0

```bash
nvm install 18.15.0
```

7. Cambiar alias de NodeJS

```bash
nvm alias default 16.15.0
```

8. Cambiar versión de NodeJS

```bash
nvm use default
```

9. instalar yarn para luego instalar dependencias del proyecto

```bash
npm install -g yarn
```

### **Clonación del repositorio**

Para obtener una copia dle proyecto se debe clonar el repositorio de GitHub, para esto se debe ejecutar el siguiente comando en la terminal:

_Nota: se debe clonar un repositorio en cada servidor, de modo que tanto backend y frontend se encuentren en servidores diferentes_

#### Backend

```bash
git clone -b dev https://github.com/Optickal095/TocataBackend.git
```

#### Frontend

```bash
git clone -b dev https://github.com/Optickal095/TocataFrontend.git
```

### **Instalar dependencias del proyecto**

#### Backend

Una vez clonado el repositorio, se deberá ingresar al directorio del proyecto

```bash
cd TocataBackend
```

Instalar dependencias del proyecto

```bash
yarn install
```

Para ejecutar el proyecto

```bash
yarn dev
```

#### Frontend

Una vez clonado el repositorio, se deberá ingresar al directorio del proyecto

```bash
cd TocataFrontend
```

Instalar dependencias del proyecto

```bash
npm install
```

Para ejecutar el proyecto

```bash
npm run start
```

Para visualizar el frontend se debe dirigir a la siguiente ruta

```bash
http://146.83.198.35:1403/
```

### **Credenciales de acceso**

| Email                   | Contraseña |
| ----------------------- | ---------- |
| eduardo.he095@gmail.com | 123456     |
| admin@admin.cl          | 123456     |
