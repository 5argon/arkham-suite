create table decks
(
    created_at    timestamp with time zone default now() not null,
    deck_chain_id uuid                                   not null references deck_chains on delete cascade,
    id            uuid                                   not null primary key
);

alter table decks
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on decks to anon;

grant delete, insert, references, select, trigger, truncate, update on decks to authenticated;

grant delete, insert, references, select, trigger, truncate, update on decks to service_role;

