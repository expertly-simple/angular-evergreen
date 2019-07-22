export function userCancelled(userInput: string | undefined) {
  return !userInput || userInput === '' || userInput === 'Cancel'
}

export function writeToTerminal(renderer: any, message: string): void {
  renderer.write(`\r\n ${message} \r\n`)
}

export function sanitizeStdOut(text: any): string {
  return text.replace(/[\n\r]/g, ' ').replace(/\s+/, '')
}
