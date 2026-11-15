alter table public.enquiries drop constraint if exists enquiries_service_check;
alter table public.enquiries add column if not exists phone_country text not null default '+91';
alter table public.enquiries add column if not exists phone text not null default '';
alter table public.enquiries add column if not exists person_type text not null default 'other';
alter table public.enquiries add column if not exists services text[] not null default array['branding'];
alter table public.enquiries add column if not exists instagram text not null default '';

update public.enquiries
set service = case service
  when 'content' then 'design'
  when 'digital' then 'pamphlet'
  when 'creative' then 'design'
  else service
end
where service in ('content', 'digital', 'creative');

update public.enquiries
set services = array[service]
where services = array['branding'] and service <> 'branding';

alter table public.enquiries add constraint enquiries_service_check
  check (service in ('collaboration', 'branding', 'design', 'pamphlet'));
alter table public.enquiries add constraint enquiries_person_type_check
  check (person_type in ('creator', 'brand', 'other'));
