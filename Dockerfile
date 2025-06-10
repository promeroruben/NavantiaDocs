# Usa una imagen ligera de Nginx como servidor web
FROM nginx:alpine

# Copia todos los archivos del proyecto a la carpeta que Nginx sirve
COPY . /usr/share/nginx/html