create table types
(
    id   serial       not null primary key,
    name varchar(255) not null,
    code varchar(255) not null
);

comment on table types is 'Card types, such as Asset, Event, etc.';

-- Add unique constraint on code
create unique index type_code_idx on types (code);

alter table types
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on types to anon;
grant delete, insert, references, select, trigger, truncate, update on types to authenticated;
grant delete, insert, references, select, trigger, truncate, update on types to service_role;
