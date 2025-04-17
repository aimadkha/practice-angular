# Angular HttpClient Best Practices Guide

## Table of Contents
1. [Installation and Setup](#installation-and-setup)
2. [Basic Usage](#basic-usage)
3. [Type Safety](#type-safety)
4. [Error Handling](#error-handling)
5. [Interceptors](#interceptors)
6. [Testing](#testing)
7. [Performance Optimization](#performance-optimization)
8. [Security](#security)
9. [Advanced Features](#advanced-features)
10. [URL Parameters and Request Methods Guide](#url-parameters-and-request-methods-guide)
11. [Authentication and Refresh Token Implementation](#authentication-and-refresh-token-implementation)

## Installation and Setup

```typescript
// In app.module.ts
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [HttpClientModule],
  // ...
})
export class AppModule { }
```

## Basic Usage

### Service Pattern
```typescript
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  getData(): Observable<Data[]> {
    return this.http.get<Data[]>('/api/data');
  }
}
```

### When to Use Different HTTP Methods

#### GET Requests
Use GET when:
- Retrieving data without modifying server state
- Fetching resources like users, products, or configurations
- Filtering, sorting, or searching data
- Accessing public APIs

```typescript
// Simple GET request
getUser(id: number): Observable<User> {
  return this.http.get<User>(`${this.apiUrl}/users/${id}`);
}

// GET with query parameters for filtering
getProducts(category: string, minPrice: number): Observable<Product[]> {
  const params = new HttpParams()
    .set('category', category)
    .set('minPrice', minPrice.toString())
    .set('sort', 'price');
  return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
}

// GET with pagination
getOrders(page: number, pageSize: number): Observable<ApiResponse<Order[]>> {
  const params = new HttpParams()
    .set('page', page.toString())
    .set('pageSize', pageSize.toString());
  return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/orders`, { params });
}
```

#### POST Requests
Use POST when:
- Creating new resources
- Submitting form data
- Complex operations that don't fit GET constraints
- Sending sensitive data (encrypted)

```typescript
// Creating a new resource
createUser(user: CreateUserDto): Observable<User> {
  return this.http.post<User>(`${this.apiUrl}/users`, user);
}

// Submitting form data
submitForm(formData: FormData): Observable<Response> {
  return this.http.post<Response>(`${this.apiUrl}/upload`, formData, {
    reportProgress: true,
    observe: 'events'
  });
}

// Authentication
login(credentials: {username: string; password: string}): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials);
}
```

#### PUT Requests
Use PUT when:
- Updating an entire resource
- Replacing all fields of an existing resource
- Idempotent operations (same result for multiple identical requests)

```typescript
// Complete resource update
updateUser(id: number, user: User): Observable<User> {
  return this.http.put<User>(`${this.apiUrl}/users/${id}`, user);
}

// Replacing a configuration
updateConfig(config: AppConfig): Observable<AppConfig> {
  return this.http.put<AppConfig>(`${this.apiUrl}/config`, config);
}
```

#### PATCH Requests
Use PATCH when:
- Partially updating a resource
- Modifying specific fields without affecting others
- Making small, specific changes

```typescript
// Partial user update
updateUserStatus(id: number, isActive: boolean): Observable<User> {
  return this.http.patch<User>(`${this.apiUrl}/users/${id}`, { isActive });
}

// Update specific product fields
updateProductPrice(id: number, price: number): Observable<Product> {
  return this.http.patch<Product>(`${this.apiUrl}/products/${id}`, { price });
}
```

### Working with Query Parameters

1. **Single Parameter**
```typescript
getSortedItems(sortBy: string): Observable<Item[]> {
  const params = new HttpParams().set('sort', sortBy);
  return this.http.get<Item[]>(`${this.apiUrl}/items`, { params });
}
```

2. **Multiple Parameters**
```typescript
searchProducts(options: {
  category?: string,
  minPrice?: number,
  maxPrice?: number,
  search?: string
}): Observable<Product[]> {
  let params = new HttpParams();
  
  if (options.category) {
    params = params.set('category', options.category);
  }
  if (options.minPrice !== undefined) {
    params = params.set('minPrice', options.minPrice.toString());
  }
  if (options.maxPrice !== undefined) {
    params = params.set('maxPrice', options.maxPrice.toString());
  }
  if (options.search) {
    params = params.set('q', options.search);
  }

  return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
}
```

3. **Array Parameters**
```typescript
filterByTags(tags: string[]): Observable<Post[]> {
  const params = new HttpParams({
    fromObject: {
      tags: tags
    }
  });
  return this.http.get<Post[]>(`${this.apiUrl}/posts`, { params });
}
```

### Best Practices for HTTP Methods

1. **GET Requests**
```typescript
// Best Practice: Always specify return type
getData(): Observable<Data> {
  return this.http.get<Data>(`${this.apiUrl}/data`);
}

// With Query Parameters
getDataWithParams(id: string): Observable<Data> {
  const params = new HttpParams().set('id', id);
  return this.http.get<Data>(`${this.apiUrl}/data`, { params });
}
```

2. **POST Requests**
```typescript
// Best Practice: Use interfaces for request body
createData(data: CreateDataDto): Observable<Data> {
  return this.http.post<Data>(`${this.apiUrl}/data`, data);
}
```

3. **PUT/PATCH Requests**
```typescript
// Best Practice: Use appropriate method based on update type
updateData(id: string, data: UpdateDataDto): Observable<Data> {
  return this.http.put<Data>(`${this.apiUrl}/data/${id}`, data);
}

partialUpdateData(id: string, patch: Partial<UpdateDataDto>): Observable<Data> {
  return this.http.patch<Data>(`${this.apiUrl}/data/${id}`, patch);
}
```

## Type Safety

### Interface Definition
```typescript
interface ApiResponse<T> {
  data: T;
  metadata: {
    timestamp: string;
    status: number;
  };
}

// Usage
getData(): Observable<ApiResponse<User[]>> {
  return this.http.get<ApiResponse<User[]>>('/api/users');
}
```

## Error Handling

### Global Error Handling
```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error) {
    if (error instanceof HttpErrorResponse) {
      // Handle HTTP errors
    }
    // Handle other errors
  }
}
```

### Service-Level Error Handling
```typescript
getData(): Observable<Data> {
  return this.http.get<Data>('/api/data').pipe(
    retry(3),
    catchError(this.handleError)
  );
}

private handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'An error occurred';
  
  if (error.error instanceof ErrorEvent) {
    // Client-side error
    errorMessage = error.error.message;
  } else {
    // Server-side error
    errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
  }
  
  return throwError(() => new Error(errorMessage));
}
```

## Interceptors

### Authentication Interceptor
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.getToken();
    
    if (authToken) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`)
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }
}
```

### Caching Interceptor
```typescript
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, HttpResponse<any>>();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    const cachedResponse = this.cache.get(req.url);
    if (cachedResponse) {
      return of(cachedResponse.clone());
    }

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cache.set(req.url, event.clone());
        }
      })
    );
  }
}
```

## Testing

### Service Testing
```typescript
describe('DataService', () => {
  let service: DataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataService]
    });

    service = TestBed.inject(DataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch data', () => {
    const testData = { id: 1, name: 'Test' };

    service.getData().subscribe(data => {
      expect(data).toEqual(testData);
    });

    const req = httpMock.expectOne('/api/data');
    expect(req.request.method).toBe('GET');
    req.flush(testData);
  });
});
```

## Performance Optimization

### Request Caching
```typescript
@Injectable()
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly MAX_CACHE_AGE = 5 * 60 * 1000; // 5 minutes

  getData(url: string): Observable<any> {
    const cached = this.cache.get(url);
    
    if (cached && !this.isExpired(cached)) {
      return of(cached.data);
    }

    return this.http.get(url).pipe(
      tap(response => this.cache.set(url, {
        data: response,
        timestamp: Date.now()
      }))
    );
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.MAX_CACHE_AGE;
  }
}
```

### Request Cancellation
```typescript
@Component({
  // ...
})
export class DataComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  getData() {
    this.dataService.getData().pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      // Handle data
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Request Batching and Optimization

#### 1. Using forkJoin for Parallel Requests
When you need to make multiple independent HTTP requests and wait for all of them to complete:

```typescript
@Injectable({
  providedIn: 'root'
})
export class BatchRequestService {
  constructor(private http: HttpClient) {}

  // Batching multiple GET requests
  loadDashboardData(): Observable<DashboardData> {
    return forkJoin({
      users: this.http.get<User[]>('/api/users'),
      products: this.http.get<Product[]>('/api/products'),
      settings: this.http.get<Settings>('/api/settings')
    }).pipe(
      map(({ users, products, settings }) => ({
        totalUsers: users.length,
        activeProducts: products.filter(p => p.active),
        appSettings: settings
      }))
    );
  }
}
```

#### 2. Request Queue Implementation
When you need to control the number of concurrent requests:

```typescript
@Injectable({
  providedIn: 'root'
})
export class RequestQueueService {
  private queue$ = new Subject<() => Observable<any>>();
  private concurrentRequests = 3; // Maximum concurrent requests

  constructor() {
    this.processQueue();
  }

  private processQueue() {
    this.queue$.pipe(
      mergeMap(request => request(), this.concurrentRequests)
    ).subscribe();
  }

  addToQueue<T>(request: () => Observable<T>): Observable<T> {
    return new Observable(observer => {
      this.queue$.next(() => 
        request().pipe(
          tap({
            next: (response) => observer.next(response),
            error: (error) => observer.error(error),
            complete: () => observer.complete()
          })
        )
      );
    });
  }

  // Usage example
  batchDownloadFiles(fileIds: string[]): Observable<File[]> {
    return forkJoin(
      fileIds.map(id => 
        this.addToQueue(() => this.http.get<File>(`/api/files/${id}`))
      )
    );
  }
}
```

#### 3. Request Debouncing and Buffering
When you need to collect multiple requests over time and send them as a batch:

```typescript
@Injectable({
  providedIn: 'root'
})
export class BatchingService {
  private batchSubject = new Subject<any>();
  private batchSize = 10;
  private batchDelay = 300; // ms

  constructor() {
    this.setupBatching();
  }

  private setupBatching() {
    this.batchSubject.pipe(
      bufferTime(this.batchDelay),
      filter(batch => batch.length > 0),
      map(batch => batch.slice(0, this.batchSize))
    ).subscribe(batch => this.processBatch(batch));
  }

  addToBatch(item: any) {
    this.batchSubject.next(item);
  }

  private processBatch(batch: any[]) {
    return this.http.post('/api/batch', { items: batch });
  }
}
```

#### 4. GraphQL Batching
When using GraphQL to combine multiple requests into a single query:

```typescript
@Injectable({
  providedIn: 'root'
})
export class GraphQLBatchService {
  batchUserData(userIds: number[]): Observable<User[]> {
    const query = `
      query BatchUsers($ids: [ID!]!) {
        users(ids: $ids) {
          id
          name
          email
          posts {
            id
            title
          }
        }
      }
    `;

    return this.http.post<GraphQLResponse>('/graphql', {
      query,
      variables: { ids: userIds }
    }).pipe(
      map(response => response.data.users)
    );
  }
}
```

#### 5. Smart Retry with Batch Recovery
Implementing smart retry logic for batch requests:

```typescript
@Injectable({
  providedIn: 'root'
})
export class SmartBatchService {
  batchUpdateWithRetry(items: any[]): Observable<any[]> {
    return this.processBatch(items).pipe(
      catchError(error => {
        if (error.status === 413) { // Payload too large
          // Split batch in half and retry
          const mid = Math.floor(items.length / 2);
          const batch1 = items.slice(0, mid);
          const batch2 = items.slice(mid);
          
          return forkJoin([
            this.batchUpdateWithRetry(batch1),
            this.batchUpdateWithRetry(batch2)
          ]).pipe(
            map(results => results.flat())
          );
        }
        return throwError(() => error);
      })
    );
  }

  private processBatch(items: any[]): Observable<any[]> {
    return this.http.post<any[]>('/api/batch', items);
  }
}
```

#### Best Practices for Request Batching

1. **Batch Size Considerations**
```typescript
@Injectable()
export class BatchConfigService {
  // Configure based on your API limits and client capabilities
  private readonly MAX_BATCH_SIZE = 50;
  private readonly OPTIMAL_BATCH_SIZE = 20;
  
  calculateOptimalBatchSize(items: any[]): number {
    return Math.min(
      this.MAX_BATCH_SIZE,
      Math.ceil(items.length / Math.ceil(items.length / this.OPTIMAL_BATCH_SIZE))
    );
  }
}
```

2. **Error Handling in Batches**
```typescript
export class BatchErrorHandler {
  handleBatchError(error: any, batch: any[]): Observable<any> {
    if (error.status === 429) { // Rate limit
      return timer(error.headers.get('Retry-After') * 1000).pipe(
        mergeMap(() => this.retryBatch(batch))
      );
    }
    return throwError(() => error);
  }

  private retryBatch(batch: any[]): Observable<any> {
    return this.batchService.processBatch(batch).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => timer(Math.pow(2, retryCount) * 1000)
      })
    );
  }
}
```

3. **Progress Tracking**
```typescript
export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
}

@Injectable()
export class BatchProgressService {
  private progress = new BehaviorSubject<BatchProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: 0
  });

  progress$ = this.progress.asObservable();

  updateProgress(update: Partial<BatchProgress>) {
    this.progress.next({
      ...this.progress.value,
      ...update
    });
  }
}
```

Remember to consider these factors when implementing request batching:
- Network conditions and latency
- Server-side limitations and rate limits
- Memory usage on client side
- Error handling and recovery strategies
- Progress tracking and user feedback
- Optimal batch size for your specific use case

## Security

### XSRF Protection
```typescript
@NgModule({
  imports: [
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN'
    })
  ]
})
export class AppModule { }
```

### Content Security
```typescript
// Sanitize URLs
constructor(private sanitizer: DomSanitizer) {}

getSafeUrl(url: string): SafeUrl {
  return this.sanitizer.bypassSecurityTrustUrl(url);
}
```

## Advanced Features

### Progress Events
```typescript
uploadFile(file: File): Observable<number> {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post('/api/upload', formData, {
    reportProgress: true,
    observe: 'events'
  }).pipe(
    map(event => {
      if (event.type === HttpEventType.UploadProgress) {
        return Math.round((100 * event.loaded) / event.total);
      }
      return 0;
    })
  );
}
```

### Parallel Requests
```typescript
combineData(): Observable<[UserData, ConfigData]> {
  return forkJoin({
    users: this.http.get<UserData>('/api/users'),
    config: this.http.get<ConfigData>('/api/config')
  });
}
```

### Retry with Backoff
```typescript
export function retryWithBackoff(
  maxRetries = 3,
  backoffMs = 1000
): MonoTypeOperatorFunction<any> {
  return pipe(
    retryWhen(errors => 
      errors.pipe(
        concatMap((error, index) => {
          const retryAttempt = index + 1;
          if (retryAttempt > maxRetries) {
            return throwError(() => error);
          }
          return timer(retryAttempt * backoffMs);
        })
      )
    )
  );
}

// Usage
getData(): Observable<Data> {
  return this.http.get<Data>('/api/data').pipe(
    retryWithBackoff(3, 1000)
  );
}
```

## URL Parameters and Request Methods Guide

### Path Variables vs Query Parameters

#### Path Variables (URL Parameters)
Path variables are part of the URL path itself and are typically used for:
- Identifying specific resources
- Hierarchical data
- Required parameters that define the resource

```typescript
// Path variable examples
export class UserService {
  // Single path variable
  getUser(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }

  // Multiple path variables
  getUserPost(userId: number, postId: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/users/${userId}/posts/${postId}`);
  }

  // Nested resources
  getComments(userId: number, postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${this.apiUrl}/users/${userId}/posts/${postId}/comments`
    );
  }
}
```

#### Query Parameters
Query parameters are used for:
- Filtering results
- Sorting
- Pagination
- Optional parameters
- Search terms

```typescript
export class ProductService {
  // Filtering with query parameters
  getProducts(filters: {
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    sort?: string
  }): Observable<Product[]> {
    let params = new HttpParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
  }
}
```

### Form Handling and PUT vs PATCH Decision Guide

#### Dynamic Form Updates
When handling forms where users can modify any number of fields, here's how to choose between PUT and PATCH:

1. **Using PATCH (Recommended for Dynamic Forms)**
```typescript
export class UserFormService {
  // PATCH - Good for partial updates when you don't know which fields will change
  updateUserProfile(userId: number, changedFields: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.patch<UserProfile>(
      `${this.apiUrl}/users/${userId}`,
      changedFields
    );
  }
}

// Usage example with forms
export class UserFormComponent {
  userForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl('')
  });

  onSubmit() {
    // Only send changed fields
    const changedValues = Object.keys(this.userForm.controls)
      .reduce((acc, key) => {
        if (this.userForm.get(key)?.dirty) {
          acc[key] = this.userForm.get(key)?.value;
        }
        return acc;
      }, {} as Partial<UserProfile>);

    if (Object.keys(changedValues).length > 0) {
      this.userFormService.updateUserProfile(this.userId, changedValues)
        .subscribe(/* handle response */);
    }
  }
}
```

2. **Using PUT (For Complete Resource Updates)**
```typescript
export class UserFormService {
  // PUT - Use when you want to replace the entire resource
  replaceUserProfile(userId: number, completeProfile: UserProfile): Observable<UserProfile> {
    return this.http.put<UserProfile>(
      `${this.apiUrl}/users/${userId}`,
      completeProfile
    );
  }
}

// Usage example with forms requiring all fields
export class CompleteUserFormComponent {
  userForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required)
  });

  onSubmit() {
    if (this.userForm.valid) {
      // Send complete object, all fields required
      this.userFormService.replaceUserProfile(
        this.userId,
        this.userForm.value as UserProfile
      ).subscribe(/* handle response */);
    }
  }
}
```

### Decision Guide: When to Use PUT vs PATCH

1. **Use PATCH when:**
- The form allows partial updates
- Users can modify any combination of fields
- You want to minimize data transfer
- The backend supports partial updates
- You're updating specific properties of a resource

```typescript
// PATCH example - Updating specific fields
interface UserUpdateDto {
  email?: string;
  name?: string;
  settings?: Partial<UserSettings>;
}

updateUserPartially(userId: number, updates: UserUpdateDto): Observable<User> {
  return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, updates);
}

// Usage
this.updateUserPartially(123, { email: 'new@email.com' }); // Only email changes
```

2. **Use PUT when:**
- All fields are required
- You want to replace the entire resource
- You need idempotency
- The business logic requires a complete object
- You're implementing a "replace" operation

```typescript
// PUT example - Complete resource update
interface UserProfile {
  email: string;
  name: string;
  settings: UserSettings;
  preferences: UserPreferences;
}

updateUserCompletely(userId: number, profile: UserProfile): Observable<User> {
  return this.http.put<User>(`${this.apiUrl}/users/${userId}`, profile);
}

// Usage - Must provide all fields
this.updateUserCompletely(123, completeUserProfile);
```

### Best Practices for Form Handling

1. **Track Changed Fields**
```typescript
export class DynamicFormComponent {
  private originalData: any;
  
  trackChanges(form: FormGroup): Partial<any> {
    return Object.keys(form.controls)
      .filter(key => form.get(key)?.dirty)
      .reduce((changes, key) => ({
        ...changes,
        [key]: form.get(key)?.value
      }), {});
  }

  submitForm() {
    const changes = this.trackChanges(this.form);
    if (Object.keys(changes).length > 0) {
      // Use PATCH for partial updates
      this.service.updateResource(this.resourceId, changes);
    }
  }
}
```

2. **Handle Complex Forms**
```typescript
export class ComplexFormService {
  // Handle nested objects and arrays
  updateComplexResource(
    resourceId: number,
    changes: Partial<ComplexResource>
  ): Observable<ComplexResource> {
    const url = `${this.apiUrl}/resources/${resourceId}`;
    
    // Use PATCH for partial updates of complex objects
    return this.http.patch<ComplexResource>(url, changes).pipe(
      catchError(this.handleError)
    );
  }

  // Handle file uploads with form data
  updateWithFiles(
    resourceId: number,
    data: Partial<ResourceData>,
    files: File[]
  ): Observable<ResourceData> {
    const formData = new FormData();
    
    // Append regular data
    formData.append('data', JSON.stringify(data));
    
    // Append files
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });

    return this.http.patch<ResourceData>(
      `${this.apiUrl}/resources/${resourceId}`,
      formData
    );
  }
}
```

## Authentication and Refresh Token Implementation

### Refresh Token Pattern
The refresh token pattern is crucial for maintaining secure, long-term user sessions while keeping access tokens short-lived. Here's how to implement it:

1. **Auth Interfaces**
```typescript
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthState {
  user: User;
  tokens: AuthTokens;
}
```

2. **Auth Service Implementation**
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly REFRESH_THRESHOLD = 60; // seconds before expiry to refresh
  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(tokens => this.storeTokens(tokens))
    );
  }

  refreshToken(): Observable<AuthTokens> {
    if (this.refreshTokenInProgress) {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => this.getStoredTokens())
      );
    }

    this.refreshTokenInProgress = true;
    const refreshToken = this.getStoredRefreshToken();

    return this.http.post<AuthTokens>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(tokens => {
        this.refreshTokenInProgress = false;
        this.storeTokens(tokens);
        this.refreshTokenSubject.next(tokens.accessToken);
      }),
      catchError(error => {
        this.refreshTokenInProgress = false;
        this.refreshTokenSubject.next(null);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem('tokens', JSON.stringify(tokens));
  }

  private getStoredTokens(): Observable<AuthTokens> {
    const tokens = localStorage.getItem('tokens');
    return tokens ? of(JSON.parse(tokens)) : throwError(() => new Error('No tokens found'));
  }

  private getStoredRefreshToken(): string | null {
    const tokens = localStorage.getItem('tokens');
    return tokens ? JSON.parse(tokens).refreshToken : null;
  }

  logout(): void {
    localStorage.removeItem('tokens');
    // Additional cleanup as needed
  }
}
```

3. **HTTP Interceptor for Auto-Refresh**
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip authentication for login and refresh endpoints
    if (this.isAuthEndpoint(req.url)) {
      return next.handle(req);
    }

    return this.addAuthHeader(req).pipe(
      switchMap(authenticatedReq => next.handle(authenticatedReq)),
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes('/auth/login') || url.includes('/auth/refresh');
  }

  private addAuthHeader(req: HttpRequest<any>): Observable<HttpRequest<any>> {
    return this.authService.getStoredTokens().pipe(
      map(tokens => {
        return req.clone({
          headers: req.headers.set('Authorization', `Bearer ${tokens.accessToken}`)
        });
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.refreshToken().pipe(
      switchMap(tokens => {
        const authenticatedReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${tokens.accessToken}`)
        });
        return next.handle(authenticatedReq);
      })
    );
  }
}
```

4. **Module Configuration**
```typescript
@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

### Usage Examples

1. **Login Flow**
```typescript
@Component({
  selector: 'app-login',
  template: `
    <form (ngSubmit)="onLogin()">
      <!-- login form fields -->
    </form>
  `
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    const credentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => this.handleLoginError(err)
    });
  }
}
```

2. **Protected API Calls**
```typescript
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  // The AuthInterceptor will automatically handle token refresh
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/profile`);
  }
}
```

### Best Practices for Token Management

1. **Security Considerations**
- Store refresh tokens securely (HttpOnly cookies when possible)
- Keep access tokens in memory, not localStorage
- Use short expiration times for access tokens (15-30 minutes)
- Use longer expiration for refresh tokens (days/weeks)
- Implement token revocation on logout

2. **Error Handling**
```typescript
private handleAuthError(error: HttpErrorResponse): Observable<never> {
  if (error.status === 401) {
    // Clear tokens and redirect to login
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  return throwError(() => new Error('Authentication failed'));
}
```

3. **Token Rotation**
```typescript
interface RotatedTokens extends AuthTokens {
  previousRefreshToken: string;
}

refreshToken(): Observable<RotatedTokens> {
  const currentRefreshToken = this.getStoredRefreshToken();
  
  return this.http.post<RotatedTokens>('/auth/refresh', { 
    refreshToken: currentRefreshToken 
  }).pipe(
    tap(tokens => {
      // Store new tokens
      this.storeTokens(tokens);
      // Invalidate previous refresh token
      this.invalidatePreviousToken(tokens.previousRefreshToken);
    })
  );
}
```

4. **Concurrent Request Handling**
```typescript
@Injectable()
export class TokenRefreshService {
  private refreshInProgress = false;
  private refreshSubject = new Subject<AuthTokens>();

  refreshToken(): Observable<AuthTokens> {
    if (!this.refreshInProgress) {
      this.refreshInProgress = true;
      this.authService.refreshToken().pipe(
        finalize(() => this.refreshInProgress = false)
      ).subscribe({
        next: tokens => this.refreshSubject.next(tokens),
        error: error => this.refreshSubject.error(error)
      });
    }
    return this.refreshSubject.asObservable();
  }
}
```

### Implementing Refresh Token with Different Backend Architectures

1. **JWT-based Authentication**
```typescript
interface JWTTokens extends AuthTokens {
  tokenType: 'Bearer';
  accessTokenExpiration: number;
  refreshTokenExpiration: number;
}

@Injectable()
export class JWTAuthService extends AuthService {
  decodeToken(token: string): any {
    return jwt_decode(token);
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    return decoded.exp * 1000 < Date.now();
  }
}
```

2. **OAuth2 Implementation**
```typescript
interface OAuth2Tokens extends AuthTokens {
  scope: string;
  tokenType: string;
}

@Injectable()
export class OAuth2Service {
  refreshToken(refreshToken: string): Observable<OAuth2Tokens> {
    const params = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken)
      .set('client_id', this.clientId);

    return this.http.post<OAuth2Tokens>('/oauth/token', null, { params });
  }
}
```

## Best Practices Summary

1. **Type Safety**
   - Always use interfaces for request/response types
   - Leverage generics in HTTP methods
   - Define clear data models

2. **Error Handling**
   - Implement proper error catching
   - Use retry strategies for transient failures
   - Provide meaningful error messages

3. **Performance**
   - Implement caching where appropriate
   - Cancel unnecessary requests
   - Use proper retry strategies

4. **Security**
   - Implement XSRF protection
   - Sanitize user input
   - Use HTTPS
   - Handle sensitive data properly

5. **Testing**
   - Write comprehensive tests
   - Use HttpTestingController
   - Test error scenarios
   - Mock HTTP requests

6. **Code Organization**
   - Use services for HTTP calls
   - Implement proper separation of concerns
   - Follow RESTful conventions