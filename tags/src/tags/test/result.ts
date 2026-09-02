import { TagBase } from "../../base.js";
import { DynamicValue } from "../../type.js";

export enum TagTypeTestResult {
  TestSucceedBy = "test-succeed-by",
  TestFailBy = "test-fail-by",
}

interface TagTestResultBase extends TagBase {
  /**
   * The margin by which the test succeeds or fails; "dynamic" for variable amounts.
   * Use 0 for "succeed by 0" or exact success.
   */
  amount: DynamicValue;
}

export interface TagTestSucceedBy extends TagTestResultBase {
  type: TagTypeTestResult.TestSucceedBy;
}

export interface TagTestFailBy extends TagTestResultBase {
  type: TagTypeTestResult.TestFailBy;
}
