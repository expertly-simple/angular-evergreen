export class Util {
  static userCancelled(userInput: string | undefined) {
    return !userInput || userInput === '' || userInput === 'Cancel'
  }
}
