CREATE TYPE public."TaskStatus" AS ENUM
    ('DRAFT',
	'STARTED',
	'INWORK',
    'ONPAUSE',
	'CANCELED',
	'COMPLETED',
	'ERROR'
);

-- Table: public."Task"
CREATE TABLE public."Task"
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
