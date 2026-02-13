create table subtypes
(
    id   serial       not null primary key,
    name varchar(255) not null,
    code varchar(255) not null
);

comment on table subtypes is 'Card subtypes, further categorization of card types.';

-- Add unique constraint on code
create unique index subtype_code_idx on subtypes (code);

alter table subtypes
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on subtypes to anon;
grant delete, insert, references, select, trigger, truncate, update on subtypes to authenticated;
grant delete, insert, references, select, trigger, truncate, update on subtypes to service_role;
