<?php

namespace App\Http\Controllers;

use App\Models\User;

abstract class Controller
{
    protected function isAdmin(User $user): bool
    {
        return in_array('admin', $user->roles ?? [], true);
    }

    protected function isDoctor(User $user): bool
    {
        return in_array('doctor', $user->roles ?? [], true);
    }
}
