<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string $location
 * @property-read Collection<int, AlternativeValue> $alternativeValues
 * @property-read Collection<int, Criterion> $criteria
 */
class Alternative extends Model
{
    /** @use HasFactory<\Database\Factories\AlternativeFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'location',
    ];

    /**
     * @return HasMany<AlternativeValue, $this>
     */
    public function alternativeValues(): HasMany
    {
        return $this->hasMany(AlternativeValue::class);
    }

    /**
     * @return BelongsToMany<Criterion, $this>
     */
    public function criteria(): BelongsToMany
    {
        return $this->belongsToMany(Criterion::class, 'alternative_values')
            ->withPivot('value')
            ->withTimestamps();
    }
}
