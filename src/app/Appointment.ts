export interface Appointment {
    id?: number;
    title: string;
    start :string;
    end: string;
    user_id: number;
    customer_bookings: [];
    room_name: string;
}