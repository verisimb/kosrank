<?php

namespace App\Enums;

enum CriterionType: string
{
    case Benefit = 'benefit';
    case Cost = 'cost';

    /**
     * Human-readable label in Bahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::Benefit => 'Benefit',
            self::Cost => 'Cost',
        };
    }
}
