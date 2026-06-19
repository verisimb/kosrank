<?php

namespace App\Http\Requests;

use App\Enums\CriterionType;
use App\Models\Criterion;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateCriterionRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $criterion = $this->route('criterion');
        $criterionId = $criterion instanceof Criterion ? $criterion->id : null;

        return [
            'code' => ['required', 'string', 'max:20', Rule::unique('criteria', 'code')->where('user_id', $this->user()->id)->ignore($criterionId)],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', new Enum(CriterionType::class)],
            'weight' => ['required', 'numeric', 'gt:0', 'max:100'],
            'unit' => ['nullable', 'string', 'max:50'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'code' => 'kode',
            'name' => 'nama kriteria',
            'type' => 'jenis',
            'weight' => 'bobot',
            'unit' => 'satuan',
        ];
    }
}
