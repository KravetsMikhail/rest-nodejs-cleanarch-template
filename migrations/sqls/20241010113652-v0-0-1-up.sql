-- Table: public."Task"
CREATE TABLE public."Task"
(
    id SERIAL,
    name text COLLATE pg_catalog."default" NOT NULL,
    search text COLLATE pg_catalog."default" NOT NULL,
    "createdBy" character varying(25) COLLATE pg_catalog."default",
    "createdAt" timestamp(3) without time zone,
    "updatedBy" character varying(25) COLLATE pg_catalog."default",
    "updatedAt" timestamp(3) without time zone,
    CONSTRAINT "Task_pkey" PRIMARY KEY (id)
);

-- Index: Task_id
CREATE UNIQUE INDEX "Task_id"
    ON public."Task" USING btree
    (id DESC)
    TABLESPACE pg_default;

ALTER TABLE public."Task"
    CLUSTER ON "Task_id";
