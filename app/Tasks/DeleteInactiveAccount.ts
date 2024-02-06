import {
  BaseTask,
  CronTimeV2,
} from "adonis5-scheduler/build/src/Scheduler/Task";
import User from "../Models/User";
import Token from "../Models/Token";

export default class DeleteInactiveAccount extends BaseTask {
  public static get schedule() {
    //every day
    return CronTimeV2.everyDay();
  }

  public static get useLock() {
    return false;
  }

  public async handle() {
    const expiredUserIds = await Token.query()
      .select("user_id")
      .where("expires_at", "<", new Date());

    await User.query()
      .whereIn(
        "id",
        expiredUserIds.map((token) => token.user_id)
      )
      .delete();

    await Token.query().where("expires_at", "<", new Date()).delete();
  }
}
