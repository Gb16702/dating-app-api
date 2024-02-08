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
    const { reported_user_id, report_reason, report_description } =
      await request.validate(ReportValidator);
    if (reported_user_id === user?.email) {
      return response.badRequest({
        message: "Tu ne peux pas te signaler toi-même",
      });
    }

    const report: UserReport | null =
      await this.checksIfIsAlreadyReportdBySameUser(
        user?.id as string,
        reported_user_id
      );
    if (report) {
      return response.badRequest({
        message: "Tu as déjà signalé cet utilisateur",
      });
    }


    try {
      await UserReport.create({
        reporter_user_id: user?.id,
        reported_user_id,
        report_reason,
        report_description,
      });
    } catch (error) {
      return response.internalServerError({
        message: error,
      });
    }

    return response.ok({ message: "Utilisateur signalé avec succès !" });
  }

  public async all({ request, response }: HttpContextContract) {
    const { page } = request.qs();
    const reports: ModelPaginatorContract<UserReport> =
      await UserReport.query().paginate(page, 10);
    return response.ok(reports);
  }

  public async cancel({ request, response }: HttpContextContract) {
    const { reporter_user_id, reported_user_id } = await request.body();
    const report: UserReport | null =
      await this.checksIfIsAlreadyReportdBySameUser(
        reporter_user_id,
        reported_user_id
      );
    if (!report)
      return response.badRequest({
        message: "Tu n'as pas signalé cet utilisateur",
      });

    await report.delete();
    return response.ok({ message: "Signalement annulé avec succès" });
  }

  public async delete({ request, response }: HttpContextContract) {
    const { id } = request.params();
    const report: UserReport | null = await UserReport.findByOrFail("id", id);

    await report.delete();

    return response.ok({ message: "Signalement supprimé avec succès" });
  }

  public async get({ request, response }: HttpContextContract) {
    const { id } = request.params();
    const report: UserReport | null = await UserReport.findByOrFail("id", id);

    return response.ok(report);
  }
}
