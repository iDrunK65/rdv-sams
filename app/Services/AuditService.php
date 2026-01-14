<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;

class AuditService
{
    public function log(?User $actor, string $action, string $entityType, ?string $entityId = null, array $payload = []): AuditLog
    {
        $log = new AuditLog();
        $log->actorUserId = $actor?->getKey();
        $log->action = $action;
        $log->entityType = $entityType;
        $log->entityId = $entityId;
        $log->payload = $payload;
        $log->createdAt = now('UTC');
        $log->save();

        return $log;
    }
}
