import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-mahasiswa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mahasiswa.component.html',
  styleUrls: ['./mahasiswa.component.css'],
})
export class MahasiswaComponent implements OnInit {
  mahasiswa: any[] = []; // Menyimpan data mahasiswa.
  prodi: any[] = []; // Menyimpan data program studi untuk dropdown.
  apiMahasiswaUrl = 'https://crud-express-main.vercel.app/api/mahasiswa'; // URL API mahasiswa.
  apiProdiUrl = 'https://crud-express-main.vercel.app/api/prodi'; // URL API program studi.
  isLoading = true; // Indikator loading data dari API.
  mahasiswaForm: FormGroup; // Form group untuk formulir reaktif mahasiswa.
  isSubmitting = false; // Indikator proses pengiriman data.

  private http = inject(HttpClient); // Injeksi HttpClient untuk HTTP request.
  private fb = inject(FormBuilder); // Injeksi FormBuilder untuk formulir reaktif.

  constructor() {
    this.mahasiswaForm = this.fb.group({
      nama: [''], // Field nama mahasiswa.
      npm: [''], // Field NPM mahasiswa.
      jenis_kelamin: [''], // Field jenis kelamin mahasiswa.
      asal_sekolah: [''], // Field asal sekolah mahasiswa.
      prodi_id: [null], // Field ID prodi mahasiswa.
    });
  }

  ngOnInit(): void {
    this.getMahasiswa(); // Memuat data mahasiswa.
    this.getProdi(); // Memuat data prodi untuk dropdown.
  }

  // Mengambil data mahasiswa
  getMahasiswa(): void {
    this.http.get<any[]>(this.apiMahasiswaUrl).subscribe({
      next: (data) => {
        this.mahasiswa = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching mahasiswa data:', err);
        this.isLoading = false;
      },
    });
  }

  // Mengambil data program studi untuk dropdown
  getProdi(): void {
    this.http.get<any[]>(this.apiProdiUrl).subscribe({
      next: (data) => {
        this.prodi = data;
      },
      error: (err) => {
        console.error('Error fetching prodi data:', err);
      },
    });
  }

  // Menghapus data mahasiswa
  deleteMahasiswa(_id: string): void {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      this.http.delete(`${this.apiMahasiswaUrl}/${_id}`).subscribe({
        next: () => {
          console.log(`Mahasiswa dengan ID ${_id} berhasil dihapus`);
          this.getMahasiswa(); // Refresh data mahasiswa setelah penghapusan.
        },
        error: (err) => {
          console.error('Error menghapus mahasiswa:', err);
        },
      });
    }
  }

  // Menambahkan mahasiswa
  addMahasiswa(): void {
    if (this.mahasiswaForm.valid) {
      this.isSubmitting = true;
      this.http.post(this.apiMahasiswaUrl, this.mahasiswaForm.value).subscribe({
        next: (response) => {
          console.log('Mahasiswa berhasil ditambahkan:', response);
          this.getMahasiswa(); // Refresh data mahasiswa setelah penambahan.
          this.mahasiswaForm.reset(); // Reset formulir.
          this.isSubmitting = false;

          // Tutup modal setelah data berhasil ditambahkan
          const modalElement = document.getElementById(
            'tambahMahasiswaModal'
          ) as HTMLElement;
          if (modalElement) {
            const modalInstance =
              bootstrap.Modal.getInstance(modalElement) ||
              new bootstrap.Modal(modalElement);
            modalInstance.hide();

            // Membersihkan atribut dan gaya pada body setelah modal ditutup
            modalElement.addEventListener(
              'hidden.bs.modal',
              () => {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                  backdrop.remove();
                }

                // Pulihkan scroll pada body
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
              },
              { once: true }
            );
          }
        },
        error: (err) => {
          console.error('Error menambahkan mahasiswa:', err);
          this.isSubmitting = false;
        },
      });
    }
  }
}
