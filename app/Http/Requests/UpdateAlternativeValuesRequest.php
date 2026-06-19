<?php

namespace App\Http\Requests;

use App\Enums\CriterionType;
use App\Models\Criterion;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAlternativeValuesRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * Payload shape: values[alternativeId][criterionId] = numeric value.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'values' => ['required', 'array'],
            'values.*' => ['array'],
            'values.*.*' => ['required', 'numeric', 'min:0'],
        ];
    }

    /**
     * Add type-aware validation: cost criteria must be greater than zero to
     * avoid division by zero during the SAW calculation.
     *
     * @return array<int, \Closure>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                /** @var array<array-key, mixed> $values */
                $values = $this->input('values', []);

                $costCriterionIds = Criterion::where('type', CriterionType::Cost)
                    ->pluck('id')
                    ->map(fn (int $id): string => (string) $id)
                    ->all();

                foreach ($values as $alternativeId => $criterionValues) {
                    if (! is_array($criterionValues)) {
                        continue;
                    }

                    foreach ($criterionValues as $criterionId => $value) {
                        if (in_array((string) $criterionId, $costCriterionIds, true) && (float) $value <= 0) {
                            $validator->errors()->add(
                                "values.{$alternativeId}.{$criterionId}",
                                'Nilai untuk kriteria cost harus lebih besar dari 0.',
                            );
                        }
                    }
                }
            },
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'values.*.*.required' => 'Nilai wajib diisi.',
            'values.*.*.numeric' => 'Nilai harus berupa angka.',
            'values.*.*.min' => 'Nilai tidak boleh negatif.',
        ];
    }
}
