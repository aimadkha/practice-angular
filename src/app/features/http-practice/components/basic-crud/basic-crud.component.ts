import { Component, OnInit } from '@angular/core';
import { HttpDemoService } from '../../services/http-demo.service';
import { Post } from '../../interfaces/post.interface';

@Component({
  selector: 'app-basic-crud',
  templateUrl: './basic-crud.component.html',
  styleUrls: ['./basic-crud.component.scss']
})
export class BasicCrudComponent implements OnInit {
  posts: Post[] = [];
  currentPost: Post = {
    title: '',
    body: '',
    userId: 1
  };
  isEditing = false;

  constructor(private httpService: HttpDemoService) { }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.httpService.getPosts().subscribe({
      next: (posts) => this.posts = posts,
      error: (error) => console.error('Error loading posts:', error)
    });
  }

  onSubmit(): void {
    if (this.isEditing && this.currentPost.id) {
      this.httpService.updatePost(this.currentPost).subscribe({
        next: (updatedPost) => {
          const index = this.posts.findIndex(p => p.id === updatedPost.id);
          if (index !== -1) {
            this.posts[index] = updatedPost;
          }
          this.resetForm();
        },
        error: (error) => console.error('Error updating post:', error)
      });
    } else {
      this.httpService.createPost(this.currentPost).subscribe({
        next: (newPost) => {
          this.posts.unshift(newPost);
          this.resetForm();
        },
        error: (error) => console.error('Error creating post:', error)
      });
    }
  }

  editPost(post: Post): void {
    this.currentPost = { ...post };
    this.isEditing = true;
  }

  deletePost(id: number): void {
    this.httpService.deletePost(id).subscribe({
      next: () => {
        this.posts = this.posts.filter(post => post.id !== id);
      },
      error: (error) => console.error('Error deleting post:', error)
    });
  }

  resetForm(): void {
    this.currentPost = {
      title: '',
      body: '',
      userId: 1
    };
    this.isEditing = false;
  }
}
