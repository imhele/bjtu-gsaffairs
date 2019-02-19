import { Service } from 'egg';

/**
 * Service of user
 */
export default class User extends Service {
  /**
   * sayHi to you
   * @param name - your name
   */
  public async sayHi(name: string) {
    const {} = this;
    return { aA: name };
  }
}
