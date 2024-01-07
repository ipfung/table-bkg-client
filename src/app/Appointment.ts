export interface Appointment {
    id?: number;
    title: string;
    start :string;
    end: string;
    user_id: number;
    customer_bookings: 
        { 
            customername: string;
            customer : {
                name: string;
            } 
        }
    ;
    room_name: string;
    color:string;
}