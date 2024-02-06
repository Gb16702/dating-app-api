import {
  BaseTask,
  CronTimeV2,
} from "adonis5-scheduler/build/src/Scheduler/Task";
import User from "../Models/User";

export default class Like extends BaseTask {
  private initialValue: number = 5;
  public static get schedule() {
    return CronTimeV2.everyDayAt(0, 0);
  }

  public static get useLock() {
    return false;
  }

  public async handle() {
    const users: User[] = await User.query()
      .where("is_profile_complete", true)
      .where("is_banned", false)
      .where("dailyLikesCount", "!=", 20)
      .update({
        daily_likes_count: this.initialValue,
      });

    this.logger.info(`Updated ${users.length} users`);
  }
}
