import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriesService } from '../../../../shared/services/categories.service';
import { Category } from '../../../../shared/models/category.model';
import { mensagemDeErro } from '../../../../shared/utils/http-error';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './categorias-form.html', 
  styleUrl: './categorias-form.scss',    
})
export class CategoriaForm implements OnInit {
  isEditMode = false;
  categoryId: string | null = null;
  readonly erro = signal<string | null>(null);

  formData: Omit<Category, 'id'> = {
    name: '',
    description: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriesService: CategoriesService,
  ) {}

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.categoryId;

    if (this.isEditMode && this.categoryId) {
      const existing = this.categoriesService.getCategoryById(this.categoryId);
      if (existing) {
        const { id, ...rest } = existing;
        this.formData = { ...rest };
      }
    }
  }

  async onSubmit(): Promise<void> {
    this.erro.set(null);

    try {
      if (this.isEditMode && this.categoryId) {
        await this.categoriesService.updateCategory(this.categoryId, this.formData);
      } else {
        await this.categoriesService.createCategory(this.formData);
      }
      this.router.navigate(['/admin/categorias']);
    } catch (erro) {
      this.erro.set(mensagemDeErro(erro, 'Não foi possível salvar a categoria.'));
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/categorias']);
  }
}