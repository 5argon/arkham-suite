create table deck_chains
(
    id          uuid                     default gen_random_uuid() not null primary key,
    created_at  timestamp with time zone default now()             not null,
    chain_index integer                                            not null
);

comment on table deck_chains is 'An entire upgrade chain of a single deck.';

alter table deck_chains
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on deck_chains to anon;

grant delete, insert, references, select, trigger, truncate, update on deck_chains to authenticated;

grant delete, insert, references, select, trigger, truncate, update on deck_chains to service_role;

