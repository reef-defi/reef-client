import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-social-media-icons',
  templateUrl: './social-media-icons.component.html',
  styleUrls: ['./social-media-icons.component.scss'],
})
export class SocialMediaIconsComponent {
  @Input() links: { [key: string]: string } | undefined;
}
