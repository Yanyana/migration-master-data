# How To Use migration master data
1. Sesuaikan `.env` didalam env terdapat setting koneksi database dan query type 
```bash
DB_USER=postgres
DB_PASSWORD=p@ssw0rd
DB_HOST=192.168.50.13
DB_PORT=5432
# DB_NAME=MUNTILAN
DB_NAME=BANJARNEGARA
QUERY_TYPE=query-rshal
```
**`QUERY_TYPE`** ini berkaitan dengan query mana yang akan di gunakan untuk mengambil master data di v1 karena ada beberapa perbedaan column atau kondisi database di v1.
2. check satu persatu query yang cocok dari mulai query-site sebagai sumber utama dan sesuaikan jika ada error query atau column yang tidak ada
3. check juga terkait nilai normal yang tidak sesuai contoh male_text, female_text, unspecified_text di masing-masing nilai normal type (numeric, alphanumeric, limitation)
``` sql
// contoh query untuk update male_text, bisa di kembangkan sesuai kondisi table
UPDATE m_normal_value_numeric_detail
SET male_text = CONCAT(male_min, ' - ', male_max), female_text = CONCAT(female_min, ' - ', female_max);

UPDATE m_normal_value_alphanum_detail mnad
SET male_text = la.alphanum_ref
FROM l_alphanumeric la
WHERE mnad.male_value = la.uid;
```

4. setelah berjalan service migration nya maka dapat mengambil langsung file berupa excel dengan cara hit
``` text
<!--port default 4080 -->
http://{base_url}:4080/download
```
5. import atau upload ke service backend v2 yang sebelum nya sudah terinstall lengkap sampai dengan migrate dan seeder inisialisasi
6. selanjutnya ke bagian transfer data transaksi v1 -> v2 bisa melihat yang sudah termigrasi 

