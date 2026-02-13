create table card_quantities
(
    created_at  timestamp with time zone default now() not null,
    deck_box_id uuid                                   not null references deck_boxes on delete cascade,
    card_id     text                                   not null references cards,
    quantity    integer                                not null,
    primary key (deck_box_id, card_id)
);

comment on table card_quantities is '"Physical" card stored in each deck storage. Contains which card it is and how many copies.';

alter table card_quantities
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on card_quantities to anon;

grant delete, insert, references, select, trigger, truncate, update on card_quantities to authenticated;

grant delete, insert, references, select, trigger, truncate, update on card_quantities to service_role;

