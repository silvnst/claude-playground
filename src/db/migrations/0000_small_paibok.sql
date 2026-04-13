CREATE TABLE `equipment` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exercise_equipment` (
	`exercise_id` text NOT NULL,
	`equipment_id` text NOT NULL,
	PRIMARY KEY(`exercise_id`, `equipment_id`),
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `exercise_muscle_groups` (
	`exercise_id` text NOT NULL,
	`muscle_group_id` text NOT NULL,
	`role` text NOT NULL,
	PRIMARY KEY(`exercise_id`, `muscle_group_id`, `role`),
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`muscle_group_id`) REFERENCES `muscle_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`movement_pattern` text,
	`mechanic` text,
	`difficulty` text,
	`instructions` text,
	`is_custom` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `muscle_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`body_region` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `template_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`order_index` integer NOT NULL,
	`target_sets` integer,
	`target_reps` integer,
	`target_weight` real,
	`target_duration_sec` integer,
	`rest_period_sec` integer DEFAULT 90,
	`notes` text,
	`superset_group` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `training_templates`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `training_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`estimated_duration_min` integer,
	`color` text DEFAULT '#f97316',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `plan_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`template_id` text NOT NULL,
	`day_index` integer NOT NULL,
	`day_label` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `training_plans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`template_id`) REFERENCES `training_templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `training_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`schedule_type` text DEFAULT 'weekly' NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`template_exercise_id` text,
	`order_index` integer NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `workout_sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`template_exercise_id`) REFERENCES `template_exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `set_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`session_exercise_id` text NOT NULL,
	`set_index` integer NOT NULL,
	`set_type` text DEFAULT 'working' NOT NULL,
	`weight` real,
	`reps` integer,
	`duration_sec` integer,
	`rpe` real,
	`is_completed` integer DEFAULT false NOT NULL,
	`rest_taken_sec` integer,
	`notes` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`session_exercise_id`) REFERENCES `session_exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text,
	`plan_id` text,
	`started_at` text NOT NULL,
	`completed_at` text,
	`duration_sec` integer,
	`notes` text,
	`rating` integer,
	`body_weight` real,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`template_id`) REFERENCES `training_templates`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`plan_id`) REFERENCES `training_plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text,
	`unit_system` text DEFAULT 'metric' NOT NULL,
	`theme` text DEFAULT 'system' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `personal_records` (
	`id` text PRIMARY KEY NOT NULL,
	`exercise_id` text NOT NULL,
	`record_type` text NOT NULL,
	`value` real NOT NULL,
	`achieved_at` text NOT NULL,
	`set_log_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`set_log_id`) REFERENCES `set_logs`(`id`) ON UPDATE no action ON DELETE no action
);
