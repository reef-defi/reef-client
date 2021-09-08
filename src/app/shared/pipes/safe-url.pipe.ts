import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
})
export class SafeUrlPipe implements PipeTransform {
  constructor(public readonly sanitizer: DomSanitizer) {}
  transform(value: string, ...args: unknown[]): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }
}
