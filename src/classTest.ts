'use strict';
import { AbstractTest } from './abstractTest.js';

export class Test extends AbstractTest {
  _str: string = '';

  constructor(str: string) {
    super(str);
    this._str = `test_${str}`;
  }

  testMethod(a: string): string {
    return `${a} ${this._str}`;
  }
}

export default Test;
