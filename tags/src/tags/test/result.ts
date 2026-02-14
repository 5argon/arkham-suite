import { TagBase } from "../../base.js";

export enum TagTypeTestResult {
  TestSucceedBy = "test-succeed-by",
  TestFailBy = "test-fail-by",
}

interface TagTestResultBase extends TagBase {
  /**
   * The margin by which the test succeeds or fails.
   * Use -1 or a special value for variable amounts.
   * Use 0 for "succeed by 0" or exact success.
   */
  amount: number;
}

export interface TagTestSucceedBy extends TagTestResultBase {
  type: TagTypeTestResult.TestSucceedBy;
}

export interface TagTestFailBy extends TagTestResultBase {
  type: TagTypeTestResult.TestFailBy;
}
