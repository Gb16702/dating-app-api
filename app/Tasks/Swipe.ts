import User from "App/Models/User";
import {
  BaseTask,
  CronTimeV2,
} from "adonis5-scheduler/build/src/Scheduler/Task";

export default class Swipe extends BaseTask {
  public initialValue: number = 20;
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
      .where("daily_swipes_count", "!=", 20)
      .update({
        daily_swipes_count: this.initialValue,
      });

    this.logger.info(`Updated ${users.length} users`);
  }
}
