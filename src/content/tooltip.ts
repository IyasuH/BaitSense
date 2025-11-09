/**
 * Tooltip component for displaying clickbait analysis
 */

import { ClickbaitAnalysis } from '@types';

export class ClickbaitTooltip {
  private element: HTMLDivElement | null = null;
  private hideTimeout: NodeJS.Timeout | null = null;

  /**
   * Show tooltip with analysis results
   */
  show(analysis: ClickbaitAnalysis, targetElement: HTMLElement): void {
    this.hide(); // Hide any existing tooltip

    this.element = this.createTooltip(analysis);
    document.body.appendChild(this.element);

    // Position tooltip near the target element
    this.positionTooltip(targetElement);

    // Add fade-in animation
    requestAnimationFrame(() => {
      if (this.element) {
        this.element.classList.add('baitsense-tooltip--visible');
      }
    });
  }

  /**
   * Hide the tooltip
   */
  hide(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    if (this.element) {
      this.element.classList.remove('baitsense-tooltip--visible');
      
      // Remove from DOM after animation
      setTimeout(() => {
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
      }, 200);
    }
  }

  /**
   * Schedule tooltip to hide after delay
   */
  scheduleHide(delay: number = 300): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    this.hideTimeout = setTimeout(() => {
      this.hide();
    }, delay);
  }

  /**
   * Cancel scheduled hide
   */
  cancelHide(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  /**
   * Create tooltip element
   */
  private createTooltip(analysis: ClickbaitAnalysis): HTMLDivElement {
    const tooltip = document.createElement('div');
    tooltip.className = 'baitsense-tooltip';
    tooltip.setAttribute('role', 'tooltip');

    const scoreClass = this.getScoreClass(analysis.score);
    
    tooltip.innerHTML = `
      <div class="baitsense-tooltip__header">
        <div class="baitsense-tooltip__title">
          <span class="baitsense-tooltip__icon">🎯</span>
          <span>BaitSense Analysis</span>
        </div>
        <div class="baitsense-tooltip__score baitsense-tooltip__score--${scoreClass}">
          ${analysis.score}%
        </div>
      </div>
      <div class="baitsense-tooltip__body">
        <p class="baitsense-tooltip__verdict">${analysis.verdict}</p>
        ${analysis.reasons.length > 0 ? `
          <ul class="baitsense-tooltip__reasons">
            ${analysis.reasons.map(reason => `<li>${reason}</li>`).join('')}
          </ul>
        ` : ''}
        <div class="baitsense-tooltip__confidence">
          Confidence: ${Math.round(analysis.confidence * 100)}%
        </div>
      </div>
    `;

    // Add event listeners to keep tooltip visible on hover
    tooltip.addEventListener('mouseenter', () => this.cancelHide());
    tooltip.addEventListener('mouseleave', () => this.scheduleHide());

    return tooltip;
  }

  /**
   * Position tooltip relative to target element
   */
  private positionTooltip(targetElement: HTMLElement): void {
    if (!this.element) return;

    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = this.element.getBoundingClientRect();

    // Calculate position (prefer top-right of target)
    let top = targetRect.top - tooltipRect.height - 10;
    let left = targetRect.right - tooltipRect.width;

    // Adjust if tooltip goes off-screen
    if (top < 10) {
      top = targetRect.bottom + 10;
    }

    if (left < 10) {
      left = 10;
    } else if (left + tooltipRect.width > window.innerWidth - 10) {
      left = window.innerWidth - tooltipRect.width - 10;
    }

    this.element.style.top = `${top + window.scrollY}px`;
    this.element.style.left = `${left + window.scrollX}px`;
  }

  /**
   * Get CSS class based on score
   */
  private getScoreClass(score: number): string {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium-high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'very-low';
  }
}
