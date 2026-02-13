create table encounters
(
    id   serial       not null primary key,
    name varchar(255) not null,
    code varchar(255) not null
);

comment on table encounters is 'Encounter sets in the game.';

-- Add unique constraint on code
create unique index encounter_code_idx on encounters (code);

alter table encounters
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on encounters to anon;
grant delete, insert, references, select, trigger, truncate, update on encounters to authenticated;
grant delete, insert, references, select, trigger, truncate, update on encounters to service_role;
