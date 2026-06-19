<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $alternative_id
 * @property int $criterion_id
 * @property string $value
 * @property-read Alternative $alternative
 * @property-read Criterion $criterion
 */
class AlternativeValue extends Model
{
    /** @use HasFactory<\Database\Factories\AlternativeValueFactory> */
    use HasFactory;

    protected $fillable = [
        'alternative_id',
        'criterion_id',
        'value',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Alternative, $this>
     */
    public function alternative(): BelongsTo
    {
        return $this->belongsTo(Alternative::class);
    }

    /**
     * @return BelongsTo<Criterion, $this>
     */
    public function criterion(): BelongsTo
    {
        return $this->belongsTo(Criterion::class);
    }
}
