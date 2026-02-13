create table play_sessions
(
    id         uuid                     default gen_random_uuid() not null primary key,
    created_at timestamp with time zone default now()             not null,
    created_by uuid                                               not null references ??? ()
);

comment on table play_sessions is 'Usually either campaign or standalone play. Links up multiple users in the same session. Deck chains assigned here are counted as "played".';

alter table play_sessions
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on play_sessions to anon;

grant delete, insert, references, select, trigger, truncate, update on play_sessions to authenticated;

grant delete, insert, references, select, trigger, truncate, update on play_sessions to service_role;

