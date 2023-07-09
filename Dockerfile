# Menggunakan base image node:lts-alpine3.15
FROM node:lts-alpine3.15

# Mengatur working directory di dalam container
WORKDIR /app

# Menyalin package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Menginstall dependensi aplikasi
RUN npm install

# Menyalin seluruh kode sumber aplikasi ke dalam container
COPY . .

# Menjalankan aplikasi ketika container dijalankan
CMD [ "node", "index.js" ]