export class UiUtils {
  static keydownPreventDecimal($event: any): void {
    if ($event.key === '.' || $event.key === ',') {
      $event.preventDefault();
    }
  }
}
