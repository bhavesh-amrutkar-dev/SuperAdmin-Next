/**
 * Utility functions for ticket-related operations
 */

/**
 * Fetches the user's IP address from an external service
 * @returns Promise<string> The IP address, defaults to "0.0.0.0" if fetch fails
 */
export const getUserIpAddress = async (): Promise<string> => {
    try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        return ipData.ip || "0.0.0.0";
    } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("Could not fetch IP address, using default");
        return "0.0.0.0";
    }
};

/**
 * Ticket source type that can contain tickets in various property names
 */
type TicketSource = {
    tickets?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
    ticketPackages?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
    ticketOptions?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
    entryOptions?: Array<{
        ticketId?: string;
        id?: string;
        _id?: string;
        price?: number;
        ticketPrice?: number;
    }>;
};

/**
 * Determines the effective ticket ID for wallet ticket applications
 * For free-ticket campaigns, we don't want to reuse the last selected 0-price ticket
 * when using wallet tickets.
 *
 * @param lotteryItem - The lottery/raffle item containing ticket sources
 * @param selectedTicket - The currently selected ticket ID
 * @returns string - The effective ticket ID, empty string if selected ticket is free (0-price)
 */
export const getEffectiveTicketId = (
    lotteryItem: TicketSource | null,
    selectedTicket: string | null
): string => {
    if (!lotteryItem || !selectedTicket) {
        return selectedTicket || "";
    }

    try {
        const ticketsSource: Array<{
            ticketId?: string;
            id?: string;
            _id?: string;
            price?: number;
            ticketPrice?: number;
        }> =
            lotteryItem.tickets ||
            (lotteryItem as any).ticketPackages ||
            (lotteryItem as any).ticketOptions ||
            (lotteryItem as any).entryOptions ||
            [];

        let effectiveTicketId = selectedTicket;

        ticketsSource.forEach((ticket: any, index: number) => {
            const ticketId = ticket.ticketId || ticket.id || ticket._id || index.toString();
            if (selectedTicket && ticketId === selectedTicket) {
                const ticketPrice = ticket.price || ticket.ticketPrice || 0;
                // If the selected ticket is a 0-price (free) ticket, ignore it when applying wallet tickets
                if (ticketPrice === 0) {
                    effectiveTicketId = "";
                }
            }
        });

        return effectiveTicketId;
    } catch (error) {
        // fail-safe: return the original selectedTicket
        return selectedTicket || "";
    }
};

