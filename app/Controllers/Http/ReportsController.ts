import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ReportValidator from "../../Validators/ReportValidator";
import UserReport from "../../Models/UserReport";
import { ModelPaginatorContract } from "@ioc:Adonis/Lucid/Orm";

export default class ReportsController {
  private checksIfIsAlreadyReportdBySameUser = async (
    reporter_user_id: string,
    reported_user_id: string
  ) => {
    return await UserReport.query()
      .where({ reporter_user_id, reported_user_id })
      .first();
  };

  public async create({ user, request, response }: HttpContextContract) {
    const {
      reporter_user_id,
      reported_user_id,
      report_reason,
      report_description,
    } = await request.validate(ReportValidator);
    if (reported_user_id === user?.id) {
      return response.badRequest({ message: "You can't report yourself" });
    }

    const report: UserReport | null =
      await this.checksIfIsAlreadyReportdBySameUser(
        reporter_user_id,
        reported_user_id
      );
    if (report) {
      return response.badRequest({ message: "You already reported this user" });
    }

    await UserReport.create({
      reporter_user_id,
      reported_user_id,
      report_reason,
      report_description,
    });

    return response.ok({ message: "Report created successfully" });
  }

  public async all({ request, response }: HttpContextContract) {
    const { page } = request.qs();
    const reports: ModelPaginatorContract<UserReport> =
      await UserReport.query().paginate(page, 10);
    return response.ok(reports);
  }

  public async cancel({ request, response }: HttpContextContract) {
    const { reporter_user_id, reported_user_id } = await request.body();
    const report: UserReport | null = await this.checksIfIsAlreadyReportdBySameUser(reporter_user_id, reported_user_id);
    if (!report) return response.badRequest({ message: "You didn't report this user" });

    await report.delete();
    return response.ok({ message: "Report deleted successfully" });
  }

  public async get({ request, response }: HttpContextContract) {
    const { id } = request.params();
    const report: UserReport | null = await UserReport.findByOrFail("id", id);

    return response.ok(report);
  }
}
