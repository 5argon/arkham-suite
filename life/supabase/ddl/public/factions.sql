create table factions
(
    id         serial       not null primary key,
    name       varchar(255) not null,
    code       varchar(255) not null,
    color      varchar(50),
    is_primary boolean      not null default true
);

comment on table factions is 'Card factions, like Guardian, Seeker, etc.';

-- Add unique constraint on code
create unique index faction_code_idx on factions (code);

alter table factions
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on factions to anon;
grant delete, insert, references, select, trigger, truncate, update on factions to authenticated;
grant delete, insert, references, select, trigger, truncate, update on factions to service_role;
