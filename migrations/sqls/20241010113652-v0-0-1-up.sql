CREATE TYPE IF NOT EXISTS public."TaskStatus" AS ENUM
    ('DRAFT',
	'STARTED',
	'INWORK',
    'ONPAUSE',
	'CANCELED',
	'COMPLETED',
	'ERROR'
);

-- Table: public."Task"
CREATE TABLE IF NOT EXISTS public."Task"
(
    id SERIAL,
    name TEXT COLLATE pg_catalog."default" NOT NULL,
    search TEXT COLLATE pg_catalog."default" NOT NULL,
    status "TaskStatus" DEFAULT 'DRAFT',
    description TEXT,
    comment TEXT,
    "projectId" BIGINT,
    "createdBy" character varying(250) COLLATE pg_catalog."default",
    "createdAt" timestamp(3) without time zone,
    "updatedBy" character varying(250) COLLATE pg_catalog."default",
    "updatedAt" timestamp(3) without time zone,
    "isDeleted" boolean DEFAULT false,
	"deletedBy" character varying(250) COLLATE pg_catalog."default",
	"deletedAt" timestamp(3) without time zone,
    CONSTRAINT "Task_pkey" PRIMARY KEY (id)
);

-- Index: Task_id
CREATE UNIQUE INDEX "Task_id"
    ON public."Task" USING btree
    (id DESC)
    TABLESPACE pg_default;

ALTER TABLE public."Task"
    CLUSTER ON "Task_id";

CREATE TABLE IF NOT EXISTS public."outbox_messages" (
    id                  BIGSERIAL PRIMARY KEY,
    status              VARCHAR(32) NOT NULL DEFAULT 'pending',
    aggregate_id        TEXT,
    message_id          uuid NOT NULL DEFAULT gen_random_uuid(),
    message_type        VARCHAR(255),
    payload             jsonb NOT NULL,
    metadata            jsonb,
    retry_count         INTEGER NOT NULL DEFAULT 0,
    next_retry_date     TIMESTAMPTZ,
    error_details       TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_outbox_messages_poll ON
    public."outbox_messages" (
        status,
        next_retry_date,
        id
    );