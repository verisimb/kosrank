<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use Database\Factories\AlternativeFactory;
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
 * @property string $location
 * @property-read Collection<int, AlternativeValue> $alternativeValues
 * @property-read Collection<int, Criterion> $criteria
 */
class Alternative extends Model
{
    /** @use HasFactory<AlternativeFactory> */
    use BelongsToUser, HasFactory;

    protected $fillable = [
        'user_id',
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
