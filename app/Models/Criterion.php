<?php

namespace App\Models;

use App\Enums\CriterionType;
use App\Models\Concerns\BelongsToUser;
use Database\Factories\CriterionFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string $code
 * @property string $name
 * @property CriterionType $type
 * @property string $weight
 * @property string|null $unit
 * @property-read Collection<int, AlternativeValue> $alternativeValues
 * @property-read Collection<int, Alternative> $alternatives
 */
class Criterion extends Model
{
    /** @use HasFactory<CriterionFactory> */
    use BelongsToUser, HasFactory;

    protected $fillable = [
        'user_id',
        'code',
        'name',
        'type',
        'weight',
        'unit',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => CriterionType::class,
            'weight' => 'decimal:2',
        ];
    }

    /**
     * @return HasMany<AlternativeValue, $this>
     */
    public function alternativeValues(): HasMany
    {
        return $this->hasMany(AlternativeValue::class);
    }

    /**
     * @return BelongsToMany<Alternative, $this>
     */
    public function alternatives(): BelongsToMany
    {
        return $this->belongsToMany(Alternative::class, 'alternative_values')
            ->withPivot('value')
            ->withTimestamps();
    }
}
