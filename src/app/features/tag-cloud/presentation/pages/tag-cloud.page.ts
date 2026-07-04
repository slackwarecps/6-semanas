import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { CardRepository } from '../../../flashcard/data/repositories/card.repository';

interface TagInfo {
  name: string;
  count: number;
  fontSize: string;
  color: string;
}

@Component({
  selector: 'app-tag-cloud-page',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './tag-cloud.page.html',
  styleUrls: ['./tag-cloud.page.scss']
})
export class TagCloudPage implements OnInit {
  tags: TagInfo[] = [];
  isLoading = true;

  constructor(
    private cardRepository: CardRepository,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadTags();
  }

  async loadTags(): Promise<void> {
    try {
      this.ngZone.run(() => {
        this.isLoading = true;
        this.cdr.markForCheck();
      });

      const cards = await this.cardRepository.findAll();
      
      const counts: Record<string, number> = {};
      for (const card of cards) {
        for (const tag of card.tags) {
          const tagName = tag.name.trim();
          if (tagName) {
            counts[tagName] = (counts[tagName] || 0) + 1;
          }
        }
      }

      const tagList = Object.entries(counts).map(([name, count]) => ({
        name,
        count
      }));

      if (tagList.length > 0) {
        const countsArray = tagList.map(t => t.count);
        const min = Math.min(...countsArray);
        const max = Math.max(...countsArray);
        
        this.tags = tagList.map(tag => {
          const scale = max > min ? (tag.count - min) / (max - min) : 0;
          const fontSize = `${0.85 + scale * 1.65}rem`;
          
          const hue = Math.floor(Math.random() * 360);
          const color = `hsl(${hue}, 80%, 65%)`;

          return {
            name: tag.name,
            count: tag.count,
            fontSize,
            color
          };
        }).sort((a, b) => a.name.localeCompare(b.name));
      } else {
        this.tags = [];
      }

      this.ngZone.run(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    } catch (err) {
      console.error('[TagCloud] Erro ao carregar tags:', err);
      this.ngZone.run(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/learn']);
  }
}
