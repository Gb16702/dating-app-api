import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import SupportTicket from "../../Models/SupportTicket";
import SupportTicketValidator from "../../Validators/SupportTicketValidator";

export default class SupportTicketController {
    public async create({ request, response, user }: HttpContextContract) {
        const { subject, description } = await request.validate(SupportTicketValidator);
        if(!user?.id) {
            return response.unprocessableEntity({
                message: "Missing user id",
            });
        }

        try {
            await SupportTicket.create({
                user_id: user.id,
                subject,
                description,
            });

            return response.created({
                message: "Support ticket has been created",
            })
        }

        catch(e) {
            return response.internalServerError({
                message: "Une erreur est survenue",
            })
        }

    }

    public async all({ request, response }: HttpContextContract) {
        const page = request.input('page', 1);
        const search = request.input('search', null);
        const perPage = 10;

        try {
            let query = SupportTicket.query().preload("user");

            if (search !== "undefined") {
                query = query.where((q) => {
                    q.where('subject', 'LIKE', `%${search}%`)
                        .orWhere('description', 'LIKE', `%${search}%`);
                });
            }

            const paginatedResult = await query.paginate(page, perPage);
            return response.ok(paginatedResult);
        } catch (e) {
            return response.internalServerError({
                message: "Une erreur est survenue",
            });
        }
    }

    public async getUserTickets({request, response, user}: HttpContextContract) {
        const { page } = request.qs();
        if(!user?.id) {
            return response.unprocessableEntity({
                message: "Missing user id",
            });
        }

        try {
            const supportTickets: SupportTicket[] = await SupportTicket.query().where("user_id", user.id).preload("user").paginate(page || 1, 10);
            return response.ok({
                supportTickets,
            });
        }

        catch(e) {
            return response.internalServerError({
                message: "Une erreur est survenue",
            });
        }
    }

    public async cancel({ user, params, response }: HttpContextContract) {
        const { id } = params;
        if(!user?.id) {
            return response.unprocessableEntity({
                message: "Missing user id",
            });
        }

        const supportTicket: SupportTicket = await SupportTicket.findOrFail(id);

        try {
            if(supportTicket.user_id !== user.id) {
                return response.unprocessableEntity({
                    message: "You are not the owner of this support ticket",
                });
            }

            await supportTicket.delete();
            return response.ok({
                message: "Support ticket has been deleted",
            });
        }

        catch(e) {
            return response.internalServerError({
                message: "Une erreur est survenue",
            });
        }
    }

    public async delete({ params, response }: HttpContextContract) {
        const { id } = params;
        const supportTicket: SupportTicket = await SupportTicket.findOrFail(id);

        try {
            await supportTicket.delete();
            return response.ok({
                message: "Support ticket has been deleted",
            });
        }

        catch(e) {
            return response.internalServerError({
                message: "Une erreur est survenue",
            });
        }
    }

    public async update({ params, response }: HttpContextContract) {
        const { id } = params;
        if (!id) {
            return response.unprocessableEntity({
                message: "Missing id",
            });
        }

        const supportTicket: SupportTicket = await SupportTicket.findOrFail(id);

        try {
            if(supportTicket.status === "closed") {
                await supportTicket.merge({
                    status: "open",
                }).save();
            } else {
                await supportTicket.merge({
                    status: "closed",
                }).save();
            }

            return response.ok({
                message: "Support ticket status has been updated",
            });
        }

        catch(e) {
            return response.internalServerError({
                message: "Une erreur est survenue",
            });
        }
    }
}