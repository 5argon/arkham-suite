create table packs
(
    id            serial                                 not null primary key,
    name          varchar(1024)                          not null,
    code          varchar(255)                           not null,
    position      smallint                               not null,
    size          smallint,
    date_release  date,
    date_creation timestamp with time zone default now() not null,
    date_update   timestamp with time zone default now() not null
);

comment on table packs is 'Card packs, expansions and core sets.';

-- Add unique constraint on code
create unique index pack_code_idx on packs (code);

alter table packs
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on packs to anon;
grant delete, insert, references, select, trigger, truncate, update on packs to authenticated;
grant delete, insert, references, select, trigger, truncate, update on packs to service_role;
