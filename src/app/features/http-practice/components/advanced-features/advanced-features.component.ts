import { Component } from '@angular/core';
import { HttpDemoService } from '../../services/http-demo.service';
import { Post } from '../../interfaces/post.interface';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-advanced-features',
  templateUrl: './advanced-features.component.html',
  styleUrls: ['./advanced-features.component.scss']
})
export class AdvancedFeaturesComponent {
  postsWithHeaders: Post[] = [];
  postsWithParams: Post[] = [];
  fullResponse?: HttpResponse<Post[]>;
  retryResponse?: Post[];
  error?: string;

  // Pagination params
  userId = 1;
  startIndex = 0;
  limit = 5;

  constructor(private httpService: HttpDemoService) { }

  demonstrateHeaders(): void {
    this.httpService.getPostsWithHeaders().subscribe({
      next: (posts) => {
        this.postsWithHeaders = posts;
        this.error = undefined;
      },
      error: (error: HttpErrorResponse) => {
        this.error = `Headers demo error: ${error.message}`;
      }
    });
  }

  demonstrateParams(): void {
    this.httpService.getPostsWithParams(this.userId, this.startIndex, this.limit).subscribe({
      next: (posts) => {
        this.postsWithParams = posts;
        this.error = undefined;
      },
      error: (error: HttpErrorResponse) => {
        this.error = `Params demo error: ${error.message}`;
      }
    });
  }

  demonstrateFullResponse(): void {
    this.httpService.getPostsWithFullResponse().subscribe({
      next: (response) => {
        this.fullResponse = response;
        this.error = undefined;
      },
      error: (error: HttpErrorResponse) => {
        this.error = `Full response demo error: ${error.message}`;
      }
    });
  }

  demonstrateRetry(): void {
    this.httpService.getPostsWithRetry().subscribe({
      next: (posts) => {
        this.retryResponse = posts;
        this.error = undefined;
      },
      error: (error) => {
        this.error = `Retry demo error: ${error.message}`;
      }
    });
  }
}
